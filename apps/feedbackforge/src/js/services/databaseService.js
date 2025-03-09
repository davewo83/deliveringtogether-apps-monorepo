/**
 * Database Service Module
 * 
 * Handles data persistence for templates and feedback history.
 * Prepared for future Supabase integration.
 */

import templates from '../config/templates.js';

// Placeholder for Supabase client
// To be replaced with actual implementation when ready
// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = 'YOUR_SUPABASE_URL';
// const supabaseKey = 'YOUR_SUPABASE_KEY';
// const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Database service with methods for data operations
 */
const databaseService = {
    /**
     * Saves a custom template
     * @param {Object} templateData - Template data to save
     * @returns {Promise<Object>} - Save result
     */
    saveTemplate: async (templateData) => {
        // Placeholder for future implementation
        console.log('saveTemplate would save template to Supabase:', templateData);
        
        // For demo purposes, save to localStorage
        try {
            // Get existing custom templates or initialize empty array
            const customTemplatesJson = localStorage.getItem('feedback_generator_templates') || '[]';
            const customTemplates = JSON.parse(customTemplatesJson);
            
            // Add a unique ID and timestamp
            const newTemplate = {
                ...templateData,
                id: `custom-${Date.now()}`,
                created_at: new Date().toISOString(),
                user_id: 'demo-user-id' // This would come from authService in real implementation
            };
            
            // Add to custom templates
            customTemplates.push(newTemplate);
            
            // Save back to localStorage
            localStorage.setItem('feedback_generator_templates', JSON.stringify(customTemplates));
            
            return { data: newTemplate, error: null };
        } catch (error) {
            console.error('Error saving template to localStorage:', error);
            return { data: null, error };
        }
        
        // Future implementation with Supabase:
        // return await supabase.from('templates').insert(templateData);
    },
    
    /**
     * Loads templates from the database
     * Merges built-in templates with custom ones
     * @returns {Promise<Object>} - Templates data
     */
    loadTemplates: async () => {
        console.log('loadTemplates would load templates from Supabase');
        
        // For demo purposes, load from localStorage and merge with built-in templates
        try {
            // Get custom templates
            const customTemplatesJson = localStorage.getItem('feedback_generator_templates') || '[]';
            const customTemplates = JSON.parse(customTemplatesJson);
            
            // Convert built-in templates to array format
            const builtInTemplatesArray = Object.entries(templates).map(([key, value]) => ({
                id: key,
                ...value,
                is_built_in: true
            }));
            
            // Merge templates giving priority to custom ones with the same ID
            const allTemplates = [
                ...builtInTemplatesArray,
                ...customTemplates
            ];
            
            return { data: allTemplates, error: null };
        } catch (error) {
            console.error('Error loading templates from localStorage:', error);
            return { data: [], error };
        }
        
        // Future implementation with Supabase:
        // const { data, error } = await supabase.from('templates').select('*');
        // if (error) return { data: [], error };
        // 
        // // Merge with built-in templates
        // const builtInTemplatesArray = Object.entries(templates).map(([key, value]) => ({
        //     id: key,
        //     ...value,
        //     is_built_in: true
        // }));
        // 
        // // Give priority to database templates when there's an ID conflict
        // const mergedTemplates = [...builtInTemplatesArray, ...data];
        // return { data: mergedTemplates, error: null };
    },
    
    /**
     * Updates a custom template
     * @param {string} id - Template ID
     * @param {Object} updates - Template updates
     * @returns {Promise<Object>} - Update result
     */
    updateTemplate: async (id, updates) => {
        console.log(`updateTemplate would update template ${id} in Supabase:`, updates);
        
        // For demo purposes, update in localStorage
        try {
            // Get existing custom templates
            const customTemplatesJson = localStorage.getItem('feedback_generator_templates') || '[]';
            const customTemplates = JSON.parse(customTemplatesJson);
            
            // Find and update the template
            const updatedTemplates = customTemplates.map(template => {
                if (template.id === id) {
                    return { 
                        ...template, 
                        ...updates, 
                        updated_at: new Date().toISOString() 
                    };
                }
                return template;
            });
            
            // Save back to localStorage
            localStorage.setItem('feedback_generator_templates', JSON.stringify(updatedTemplates));
            
            // Find the updated template to return
            const updatedTemplate = updatedTemplates.find(template => template.id === id);
            return { data: updatedTemplate, error: null };
        } catch (error) {
            console.error('Error updating template in localStorage:', error);
            return { data: null, error };
        }
        
        // Future implementation with Supabase:
        // return await supabase.from('templates').update(updates).match({ id });
    },
    
    /**
     * Deletes a custom template
     * @param {string} id - Template ID
     * @returns {Promise<Object>} - Delete result
     */
    deleteTemplate: async (id) => {
        console.log(`deleteTemplate would delete template ${id} from Supabase`);
        
        // For demo purposes, delete from localStorage
        try {
            // Get existing custom templates
            const customTemplatesJson = localStorage.getItem('feedback_generator_templates') || '[]';
            const customTemplates = JSON.parse(customTemplatesJson);
            
            // Filter out the template to delete
            const filteredTemplates = customTemplates.filter(template => template.id !== id);
            
            // Save back to localStorage
            localStorage.setItem('feedback_generator_templates', JSON.stringify(filteredTemplates));
            
            return { data: { id }, error: null };
        } catch (error) {
            console.error('Error deleting template from localStorage:', error);
            return { data: null, error };
        }
        
        // Future implementation with Supabase:
        // return await supabase.from('templates').delete().match({ id });
    },
    
    /**
     * Saves feedback history entry
     * @param {Object} feedbackData - Feedback data to save
     * @returns {Promise<Object>} - Save result
     */
    saveFeedbackHistory: async (feedbackData) => {
        console.log('saveFeedbackHistory would save feedback history to Supabase:', feedbackData);
        
        // For demo purposes, save to localStorage
        try {
            // Get existing feedback history or initialize empty array
            const historyJson = localStorage.getItem('feedback_generator_history') || '[]';
            const history = JSON.parse(historyJson);
            
            // Add a unique ID
            const newEntry = {
                ...feedbackData,
                id: `history-${Date.now()}`,
                user_id: 'demo-user-id' // This would come from authService in real implementation
            };
            
            // Add to history
            history.push(newEntry);
            
            // Save back to localStorage
            localStorage.setItem('feedback_generator_history', JSON.stringify(history));
            
            return { data: newEntry, error: null };
        } catch (error) {
            console.error('Error saving feedback history to localStorage:', error);
            return { data: null, error };
        }
        
        // Future implementation with Supabase:
        // return await supabase.from('feedback_history').insert(feedbackData);
    },
    
    /**
     * Loads feedback history
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - History data
     */
    loadFeedbackHistory: async (options = {}) => {
        console.log('loadFeedbackHistory would load feedback history from Supabase', options);
        
        // For demo purposes, load from localStorage
        try {
            // Get feedback history
            const historyJson = localStorage.getItem('feedback_generator_history') || '[]';
            const history = JSON.parse(historyJson);
            
            // Sort by timestamp in descending order (newest first)
            const sortedHistory = [...history].sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            // Apply limit if specified
            const limitedHistory = options.limit 
                ? sortedHistory.slice(0, options.limit) 
                : sortedHistory;
            
            return { data: limitedHistory, error: null };
        } catch (error) {
            console.error('Error loading feedback history from localStorage:', error);
            return { data: [], error };
        }
        
        // Future implementation with Supabase:
        // let query = supabase.from('feedback_history').select('*');
        // 
        // if (options.limit) {
        //     query = query.limit(options.limit);
        // }
        // 
        // return await query.order('timestamp', { ascending: false });
    }
};

export default databaseService;