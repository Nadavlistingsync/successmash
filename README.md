# More Cracked or Less Cracked 🏆

An achievement comparison game inspired by Facemash, but focused on comparing how "cracked" (successful/achieved) people are based on their university, internships, awards, certifications, and career milestones.

## 🎯 Overview

More Cracked or Less Cracked allows users to compare two people side-by-side based on their achievements and vote on who they think is more "cracked" (successful/achieved). The app tracks voting patterns and maintains a leaderboard of the most cracked individuals.

## ✨ Features

### Core Functionality
- **Side-by-side Comparison**: Compare two people with their achievements displayed
- **Voting System**: Vote on who you think is more "cracked"
- **Leaderboard**: See rankings based on cracked scores
- **Profile Management**: Add new profiles
- **Cracked Scoring**: Algorithm that considers win rate, experience, and achievements

### Profiles Include
- Profile picture (with placeholder fallback)
- Name and job title
- University/education
- Current company/role
- LinkedIn profile URL
- List of achievements (internships, awards, certifications, etc.)
- Industry categorization

### Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Data persists between sessions
- **Automatic Feedback Loop**: Built-in debugging and error tracking
- **Smooth Animations**: Professional UI transitions
- **Accessibility**: WCAG compliant design

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start comparing professionals!

### Usage

#### Comparing People
1. Navigate to the "Compare" tab
2. Two people will be displayed side-by-side
3. Review their achievements, experience, and current roles
4. Click "More Cracked" on your choice
5. A new comparison will automatically load

#### Adding New Profiles
1. Click the "Add Profile" tab
2. Fill in the required information:
   - Full Name
   - Job Title
   - University
   - Company/Organization
   - Profile Image URL (optional)
   - LinkedIn Profile URL (optional)
   - Achievements (one per line)
   - Industry
3. Click "Add Profile" to save

#### Viewing Leaderboard
1. Click the "Leaderboard" tab
2. See people ranked by cracked score
3. View wins, total votes, and overall ranking

## 🏗️ Architecture

### File Structure
```
SuccessMash/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

### Data Structure
```javascript
{
  id: number,
  name: string,
  title: string,
  company: string,
  experience: number,
  imageUrl: string,
  achievements: string[],
  industry: string,
  wins: number,
  totalVotes: number,
  successScore: number
}
```

### Cracked Score Algorithm
The cracked score is calculated using:
- **Win Rate (70%)**: Percentage of votes won
- **Achievement Bonus (30%)**: Number of achievements (capped at 10 achievements)

## 🔧 Debugging & Development

### Automatic Feedback Loop
The application includes a built-in debugging system:

```javascript
// Get debug information
window.crackedComparison.getDebugInfo()

// Export all data for analysis
window.crackedComparison.exportData()

// Add custom log entry
window.crackedComparison.log("Custom message", "info")
```

### Debug Features
- **Error Tracking**: Automatic error detection and logging
- **Performance Monitoring**: Page load time tracking
- **Data Export**: Export all application data for analysis
- **Console Logging**: Detailed logging with timestamps
- **Local Storage Monitoring**: Track data persistence

### Browser Console Commands
```javascript
// View debug information
window.crackedComparison.getDebugInfo()

// Export debug data
window.crackedComparison.exportData()

// View all logs
JSON.parse(localStorage.getItem('crackedComparison_logs'))

// View all errors
JSON.parse(localStorage.getItem('crackedComparison_errors'))

// Clear all data
localStorage.clear()
```

## 🎨 Design Features

### Visual Design
- **Modern Gradient Background**: Purple to blue gradient
- **Card-based Layout**: Clean, professional card design
- **Smooth Animations**: Hover effects and transitions
- **Responsive Grid**: Adapts to different screen sizes
- **Professional Typography**: Inter font family

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **High Contrast Support**: Respects user's contrast preferences
- **Reduced Motion Support**: Respects user's motion preferences
- **Focus Indicators**: Clear focus states for all interactive elements

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with side-by-side comparison
- **Tablet**: Optimized layout with stacked cards
- **Mobile**: Single-column layout with touch-friendly buttons

## 🔒 Privacy & Data

### Data Storage
- All data is stored locally in the browser's localStorage
- No data is sent to external servers
- Data persists between browser sessions
- Users can clear data by clearing browser storage

### Data Export
- Users can export their data for backup or analysis
- Export includes profiles, votes, statistics, and debug logs
- Data is exported as JSON format

## 🚀 Future Enhancements

### Planned Features
- **Industry Filtering**: Filter comparisons by industry
- **Achievement Categories**: Categorize achievements (tech, business, etc.)
- **Social Sharing**: Share results on social media
- **Achievement Verification**: System to verify achievements
- **Profile Import**: Import profiles from LinkedIn or GitHub
- **Advanced Analytics**: Detailed voting patterns and trends

### Technical Improvements
- **PWA Support**: Progressive Web App capabilities
- **Offline Mode**: Work without internet connection
- **Data Sync**: Cloud storage integration
- **API Integration**: Real-time data from professional networks

## 🤝 Contributing

This is a demonstration project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by the original Facemash concept
- Built with modern web technologies
- Designed for professional use and learning

## 📞 Support

For questions or issues:
1. Check the browser console for debug information
2. Use the built-in debugging tools
3. Export data for analysis
4. Clear browser storage if needed

---

**More Cracked or Less Cracked** - Compare achievements responsibly! 🏆
