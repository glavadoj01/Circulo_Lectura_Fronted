import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
    content: ['./src/**/*.{html,ts,scss}'],
    plugins: [daisyui],
};

export default config;
