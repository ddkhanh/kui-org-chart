module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {

    extend: {    
      dropShadow: {
        '3xl': '0 35px 35px rgba(0, 255, 0, 0.9)',
        '4xl': [
            '0 35px 35px rgba(0, 0, 255, 0.9)',
            '0 45px 65px rgba(0, 0, 255, 0.7)'
        ]
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(24, 167, 24, 0.8)',
      },
      width: {
        '7/18': '39%',
        '96/100': '96%',
        '98': '98px',
        '94': '94px',
      },
      height: {
        '94': '94px'
      },
      borderRadius: {
        'cir': '50%',
      }
    },
  },
  plugins: [],
}
