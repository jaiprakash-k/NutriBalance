# NutriBalance 🥗

A comprehensive single-file React nutrition analysis application that helps users track their daily nutrition intake, visualize nutrients, and get personalized diet recommendations.

## 🌟 Features

### User Features
- **Nutrition Analysis**: Input your dietary habits (age, weight, height, activity level, meals)
- **Real-time Food Search**: Search for foods using the USDA Food Data Central API
- **Interactive Visualizations**: Bar charts showing nutrient intake vs recommendations
- **Personalized Suggestions**: Get tailored diet recommendations based on your profile
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: WCAG-compliant with proper ARIA labels and keyboard navigation

### Admin Features
- **Food Database Management**: Add, edit, and remove foods from the database
- **Recommendations Management**: Update daily nutrient recommendations for different age groups
- **User Data Analytics**: View and export user submissions as CSV
- **Protected Access**: Simple password-protected admin panel

### Technical Features
- **Client-side Only**: No backend required - all data stored in localStorage
- **API Integration**: Ready for USDA Food Data Central API
- **Offline Capability**: Works with fallback sample data when API is unavailable
- **Data Export**: CSV export functionality for user submissions

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaiprakash-k/NutriBalance.git
   cd NutriBalance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 🏗️ Project Structure

```
NutriBalance/
├── NutriBalanceApp.jsx    # Main React component (single-file app)
├── index.jsx              # React entry point
├── index.css              # Tailwind CSS imports
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── webpack.config.js      # Webpack configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── .babelrc               # Babel configuration
└── README.md              # This file
```

## 🔧 Configuration

### USDA API Setup
The app is pre-configured with USDA Food Data Central API integration. To use your own API key:

1. Get a free API key from [USDA Food Data Central](https://fdc.nal.usda.gov/api-guide.html)
2. Replace the API key in `NutriBalanceApp.jsx`:
   ```javascript
   const API_KEY = "your-api-key-here";
   ```

### Admin Access
- Default admin password: `nutriadmin`
- Change the password in the `handleAdminLogin` function in `NutriBalanceApp.jsx`

## 📊 Usage Guide

### For Users

1. **Start Analysis**: Click "Start Nutrition Analysis" on the home page
2. **Enter Profile**: Fill in your age, weight, height, and activity level
3. **Search Foods**: Use the search feature to find foods from the USDA database
4. **Add Meals**: Add foods to your daily meal list with portion sizes
5. **Analyze**: Click "Analyze Nutrition" to see your nutrient breakdown
6. **View Results**: See interactive charts and personalized recommendations

### For Admins

1. **Access Admin Panel**: Click "Admin Panel" and enter password
2. **Manage Foods**: Add, edit, or remove foods in the database
3. **Update Recommendations**: Modify daily nutrient recommendations by age group
4. **Export Data**: Download user submissions as CSV for analysis

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **Recharts**: Interactive charts and data visualization
- **Tailwind CSS**: Utility-first CSS framework
- **Webpack 5**: Module bundler and dev server
- **Babel**: JavaScript transpiler
- **USDA Food Data Central API**: Real-time food and nutrition data

## 🔄 API Integration Guide

The app is designed for easy API integration. Current implementation uses USDA Food Data Central API, but you can modify it for other nutrition APIs:

### Current API Endpoints
- Search Foods: `https://api.nal.usda.gov/fdc/v1/foods/search`

### Adding New APIs
1. Modify the `fetchFood` function in `NutriBalanceApp.jsx`
2. Update the nutrient mapping logic
3. Add error handling for API failures

### Backend Integration
To connect to a backend:
1. Replace localStorage calls with API endpoints
2. Add authentication for admin features
3. Implement server-side data persistence

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update CSS classes in `NutriBalanceApp.jsx`
- Add custom styles in `index.css`

### Nutrients
- Add new nutrients in the `defaultFoodDB` structure
- Update the `calculateNutrients` function
- Modify the recommendations object

### Recommendations
- Update `defaultRecommendations` for different nutrient targets
- Add new age groups or activity levels
- Customize suggestion algorithms

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [USDA Food Data Central](https://fdc.nal.usda.gov/) for providing comprehensive food and nutrition data
- [Recharts](https://recharts.org/) for beautiful and responsive charts
- [Tailwind CSS](https://tailwindcss.com/) for rapid UI development
- React community for excellent documentation and ecosystem

## 📧 Contact

**Jaiprakash K** - [@jaiprakash-k](https://github.com/jaiprakash-k)

Project Link: [https://github.com/jaiprakash-k/NutriBalance](https://github.com/jaiprakash-k/NutriBalance)

---

⭐ **Star this repo if you found it helpful!**

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Meal planning and scheduling
- [ ] Progress tracking over time
- [ ] Integration with fitness trackers
- [ ] Recipe suggestions
- [ ] Barcode scanning for food items
- [ ] Offline PWA functionality
- [ ] Multi-language support
- [ ] Social sharing features
- [ ] Integration with health apps
