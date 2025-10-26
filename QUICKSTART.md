# 🚀 Krishi Sanrakshan (कृषि संरक्षण) - Quick Start Guide

## Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd /Users/sarthakyadav/Desktop/Ps25262
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: **http://localhost:3000**

---

## 📱 Dashboard Pages

Once running, you can access:

1. **Dashboard** (`/`) - Main overview with stats and map
2. **Crop Images** (`/images`) - Gallery with filters
3. **Damage Alerts** (`/alerts`) - Alert management
4. **Analytics** (`/analytics`) - Charts and insights
5. **Regions** (`/regions`) - Geographic overview

---

## 🎯 Key Features to Explore

### Main Dashboard
- ✅ View 6 key statistics cards
- ✅ Interactive map with crop locations
- ✅ Recent damage alerts
- ✅ Activity timeline

### Crop Images Gallery
- ✅ Filter by crop type, growth stage, health status
- ✅ Search functionality
- ✅ View AI analysis results
- ✅ 60 sample images from 30+ crop types

### Damage Alerts
- ✅ Filter by status and severity
- ✅ Export to CSV
- ✅ View detailed alert information

### Analytics
- ✅ 30-day health trend chart
- ✅ Damage distribution pie chart
- ✅ Regional comparison bar chart
- ✅ Crop type distribution
- ✅ Export analytics report (JSON)

### Regions
- ✅ Full-screen map view
- ✅ State-wise filtering
- ✅ Location statistics

---

## 📊 Sample Data

The dashboard comes with **mock data** including:
- **60 crop images** (2 per crop type)
- **30+ crop varieties** from Agricultural-crops dataset
- **15 Indian states** with realistic locations
- **Multiple damage types** (flood, pest, disease, drought, etc.)
- **Various health statuses** (healthy, stressed, damaged, critical)

---

## 🎨 Design System

### Color Coding
- 🟢 **Green** - Healthy crops
- 🟡 **Yellow** - Stressed crops
- 🟠 **Orange** - Damaged crops
- 🔴 **Red** - Critical condition

### Dashboard Theme
- Primary: Green (Agriculture/Growth)
- Accent colors for different statuses
- Responsive design for all screen sizes

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Map Not Loading
- Check internet connection (Leaflet uses OpenStreetMap tiles)
- Clear browser cache
- Ensure port 3000 is accessible

---

## 📝 Next Steps

### Connect to Backend
1. Set up FastAPI backend
2. Update `.env.local` with backend URL
3. Uncomment API calls in `lib/api.ts`

### Database Integration
1. Set up MySQL database
2. Create tables based on TypeScript interfaces
3. Update API endpoints

### Deploy to Production
1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or your server
3. Configure environment variables

---

## 💡 Tips

- **Navigation**: Use the sidebar to switch between pages
- **Responsive**: Try resizing your browser to see mobile view
- **Filters**: Experiment with different filter combinations
- **Export**: Use export features on Alerts and Analytics pages
- **Map**: Click markers to see crop details in popups

---

## 🆘 Need Help?

Check the main `README.md` for detailed documentation.

**Happy Monitoring! 🌾**

