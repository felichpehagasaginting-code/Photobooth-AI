import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			/* Semantic brand tokens */
  			copper: 'var(--copper)',
  			amber: 'var(--amber)',
  			mint: 'var(--mint)',
  			edge: 'var(--edge)',
  			surface: 'var(--surface)',
  			'surface-raised': 'var(--surface-raised)',
  			/* Legacy kept for gradual migration */
  			premium: {
  				pink: 'var(--copper)',
  				cyan: 'var(--mint)',
  				gold: 'var(--amber)',
  				purple: '#8a6ff0',
  				orange: 'var(--copper)',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '20px',
  			'3xl': '24px',
  		},
  		spacing: {
  			'safe': 'max(env(safe-area-inset-top), 1rem)',
  		},
  		fontFamily: {
  			'display': ['var(--font-display)', 'Georgia', 'serif'],
  			'body': ['var(--font-body)', 'system-ui', 'sans-serif'],
  			/* Legacy aliases — kept for gradual migration */
  			'outfit': ['var(--font-display)', 'Georgia', 'serif'],
  			'inter': ['var(--font-body)', 'system-ui', 'sans-serif'],
  		},
  		fontSize: {
  			'xs': ['12px', { lineHeight: '16px', letterSpacing: '0em' }],
  			'sm': ['14px', { lineHeight: '20px', letterSpacing: '0em' }],
  			'base': ['16px', { lineHeight: '24px', letterSpacing: '0em' }],
  			'lg': ['18px', { lineHeight: '28px', letterSpacing: '0em' }],
  			'xl': ['20px', { lineHeight: '28px', letterSpacing: '0em' }],
  			'2xl': ['24px', { lineHeight: '32px', letterSpacing: '0em' }],
  			'3xl': ['32px', { lineHeight: '40px', letterSpacing: '0em' }],
  			'4xl': ['40px', { lineHeight: '48px', letterSpacing: '0em' }],
  		},
  		animation: {
  			'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
  			'float-particle': 'float-particle 6s ease-in-out infinite',
  			'gradient-shift': 'gradient-shift 8s ease infinite',
  			'shimmer': 'shimmer 2s infinite',
  			'float': 'float 6s ease-in-out infinite',
  			'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
  			'scale-spin': 'scale-spin 2s ease-in-out infinite',
  			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
  			'slide-up': 'slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'slide-down': 'slide-down 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  		},
  		keyframes: {
  			'pulse-neon': {
  				'0%, 100%': {
  					boxShadow: '0 0 15px rgba(255, 107, 157, 0.3), 0 0 30px rgba(255, 107, 157, 0.1)',
  				},
  				'50%': {
  					boxShadow: '0 0 25px rgba(255, 107, 157, 0.5), 0 0 50px rgba(255, 107, 157, 0.2)',
  				},
  			},
  			'float-particle': {
  				'0%, 100%': {
  					transform: 'translateY(0) translateX(0) scale(1)',
  					opacity: '0.2',
  				},
  				'25%': {
  					transform: 'translateY(-30px) translateX(15px) scale(1.5)',
  					opacity: '0.6',
  				},
  				'50%': {
  					transform: 'translateY(-10px) translateX(-10px) scale(1)',
  					opacity: '0.3',
  				},
  				'75%': {
  					transform: 'translateY(-40px) translateX(5px) scale(1.8)',
  					opacity: '0.5',
  				},
  			},
  			'gradient-shift': {
  				'0%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  				'100%': { backgroundPosition: '0% 50%' },
  			},
  			'shimmer': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' },
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			'glow-pulse': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.7' },
  			},
  			'scale-spin': {
  				'0%': { transform: 'scale(1) rotate(0deg)' },
  				'50%': { transform: 'scale(1.05) rotate(180deg)' },
  				'100%': { transform: 'scale(1) rotate(360deg)' },
  			},
  			'bounce-subtle': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-4px)' },
  			},
  			'slide-up': {
  				'from': { transform: 'translateY(20px)', opacity: '0' },
  				'to': { transform: 'translateY(0)', opacity: '1' },
  			},
  			'slide-down': {
  				'from': { transform: 'translateY(-20px)', opacity: '0' },
  				'to': { transform: 'translateY(0)', opacity: '1' },
  			},
  			'fade-in': {
  				'from': { opacity: '0' },
  				'to': { opacity: '1' },
  			},
  			'scale-in': {
  				'from': { transform: 'scale(0.95)', opacity: '0' },
  				'to': { transform: 'scale(1)', opacity: '1' },
  			},
  		},
  		transitionTimingFunction: {
  			'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'spring-smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  			'ease-out-smooth': 'cubic-bezier(0.33, 1, 0.68, 1)',
  		},
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
