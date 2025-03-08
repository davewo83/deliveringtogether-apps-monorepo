const { createClient } = require('@supabase/supabase-js');
// You could import from shared package once set up
// const { initSupabase } = require('@deliveringtogether/auth');

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
    console.log('Categories function called');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return { 
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          categories: [],
          debug: {
            error: "Missing Supabase configuration"
          }
        }) 
      };
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    // With shared auth package: const supabase = initSupabase();
    
    // Query categories
    const { data, error } = await supabase
      .from('questions')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Supabase query error:', error);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          categories: [],
          debug: {
            error: "Error querying categories",
            message: error.message
          }
        })
      };
    }
    
    console.log('Categories data received:', data ? `${data.length} items` : 'none');
    
    // Handle potential undefined data
    if (!data || !Array.isArray(data)) {
      console.warn('No data or invalid data returned from Supabase');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          categories: [],
          debug: {
            warning: "No data or invalid data structure returned"
          }
        }),
      };
    }
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))].sort();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        categories,
        debug: {
          count: categories.length
        }
      }),
    };
  } catch (error) {
    console.error("Error in categories function:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        categories: [],
        debug: {
          error: "Exception in function",
          message: error.message
        }
      }),
    };
  }
};