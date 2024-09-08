/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },      
    images: {
        loader: 'custom',
        loaderFile: './src/lib/supabase-image-loader.js',
    },
};

export default nextConfig;