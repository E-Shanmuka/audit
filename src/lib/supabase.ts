import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://wjjvzogmnnglvnirimsi.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjU2ZGRmM2VjLTNhMmQtNGQ0Mi1hYTRhLTU1MTc1NDIwNWZkOSJ9.eyJwcm9qZWN0SWQiOiJ3amp2em9nbW5uZ2x2bmlyaW1zaSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc3NTI1NjM2LCJleHAiOjIwOTI4ODU2MzYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.5Z9uG8ECOHDQKsdiRVNVQnk0fqg7_10icM7lV6HQmo4';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };