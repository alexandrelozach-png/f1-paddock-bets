import { createClient } from "@supabase/supabase-js";

// Remplacez ces deux valeurs par celles fournies dans votre tableau de bord Supabase
const SUPABASE_URL = "https://ijzvcarjjtmebhdeqcrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqenZjYXJqanRtZWJoZGVxY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDgwNzMsImV4cCI6MjEwNTI4NDA3M30.QJcgfmW9qrdyP3VS2vYFi8oxiRds20wipdDIOXyz3wA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);