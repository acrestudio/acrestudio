module.exports = {
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontSize: {
        xs: ['0.8125rem', '1rem'],
        sm: ['0.875rem', '1.25rem'],
        base: ['1rem', '1.5rem'],
        lg: ['1.125rem', '1.75rem'],
        xl: ['1.25rem', '1.75rem'],
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['1.875rem', '2.25rem'],
        '4xl': ['2.25rem', '2.5rem'],
        '5xl': ['3rem', '3.25rem'],
        '6xl': ['3.75rem', '1'],
        '7xl': ['4.5rem', '1'],
        '8xl': ['5rem', '1'],
        '9xl': ['5.5rem', '1'],
      },
      colors: {
        blue: {
          DEFAULT: '#02255A',
          50: '#E4EEFE',
          100: '#B9D5FD',
          200: '#65A1FB',
          300: '#106DF9',
          400: '#0448AE',
          500: '#02255A',
          600: '#021F4B',
          700: '#02193C',
          800: '#01132D',
          900: '#010C1E',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
