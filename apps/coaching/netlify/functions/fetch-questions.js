const { createClient } = require('@supabase/supabase-js');
// In the future, you could import from shared packages:
// const { initSupabase } = require('@deliveringtogether/auth');
// const { safelyParseJson } = require('@deliveringtogether/utils');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request (preflight CORS check)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }
  
  try {
    console.log('Questions function called with params:', event.queryStringParameters);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          records: [],
          offset: "DONE",
          debug: {
            error: "Missing required environment variables"
          }
        })
      };
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    // In the future: const supabase = initSupabase();
    
    // Get query parameters
    const offsetStr = event.queryStringParameters?.offset;
    const category = event.queryStringParameters?.category;
    
    // Handle pagination - convert string offset to number
    let offsetNum = offsetStr && offsetStr !== "DONE" 
      ? parseInt(offsetStr, 10) 
      : 0;
    
    // Invalid offset or "DONE" string means start from beginning
    if (isNaN(offsetNum)) offsetNum = 0;
    
    // Define page size
    const pageSize = 10;
    
    console.log("Processing request with params:", { offsetNum, category });
    
    // Build query without ordering by created_at since it doesn't exist
    let query = supabase
      .from('questions')
      .select(`
        id,
        question_text,
        category,
        when_to_use,
        expected_outcome,
        variations,
        follow_up_questions
      `);
      
    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    // Add pagination
    query = query.range(offsetNum, offsetNum + pageSize - 1);
    
    // Execute the query
    console.log('Executing Supabase query');
    const { data: records, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          records: [],
          offset: "DONE",
          debug: {
            error: "Error querying questions",
            message: error.message
          }
        })
      };
    }
    
    console.log(`Query returned ${records?.length || 0} records`);
    
    // Check if there are more records
    if (!records || !Array.isArray(records)) {
      console.warn('No records returned from Supabase');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          records: [],
          offset: "DONE",
          debug: {
            warning: "No records or invalid data structure returned"
          }
        }),
      };
    }
    
    // Check for more records with a separate query
    const moreQuery = supabase
      .from('questions')
      .select('id')
      .limit(1);
      
    // Add the same category filter if present
    if (category) {
      moreQuery.eq('category', category);
    }
    
    // Add range filter for next page
    moreQuery.range(offsetNum + pageSize, offsetNum + pageSize);
    
    const { data: moreData, error: moreError } = await moreQuery;
    
    if (moreError) {
      console.error('Error checking for more records:', moreError);
      // Don't throw here, just assume no more records
    }
    
    // Transform data to match format expected by frontend
    console.log('Transforming records to expected format');
    const transformedRecords = records.map(record => ({
      id: record.id,
      fields: {
        'Question Text': record.question_text || '',
        'Category': record.category || '',
        'When to Use': record.when_to_use || '',
        'Expected Outcome': record.expected_outcome || '',
        'Variations': record.variations || '',
        'Follow-Up Questions': record.follow_up_questions || '',
      }
    }));
    
    // Calculate next offset or set to "DONE"
    const hasMoreRecords = moreData && moreData.length > 0;
    const nextOffset = hasMoreRecords 
      ? (offsetNum + pageSize).toString() 
      : "DONE";
    
    console.log(`Returning ${transformedRecords.length} records with nextOffset: ${nextOffset}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        records: transformedRecords,
        offset: nextOffset,
        debug: {
          recordCount: transformedRecords.length,
          hasMoreRecords
        }
      }),
    };
  } catch (error) {
    console.error("Function Error:", error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        records: [],
        offset: "DONE",
        debug: {
          error: "Exception in function",
          message: error.message
        }
      }),
    };
  }
};