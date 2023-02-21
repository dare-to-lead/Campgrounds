const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./citiesHelpers')

mongoose.set("strictQuery", true);
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb://127.0.0.1:27017/yelp-camp"
  );
}

const db = mongoose.connection
db.on('error',console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})
const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
  await Campground.deleteMany({})
  for(let i=0;i<200;i++){
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 30) + 10
    const camp = new Campground({
      auther: "63f449f7e244483b15990af4",
    location: `${cities[random1000].city}, ${cities[random1000].state}`,
    title: `${sample(descriptors)} ${sample(places)}`,
    description:'Lorem ipsum dolor sit amet consectetur adipisicing elit.'+
    'Vero ipsa natus reprehenderit, illo accusamus minus necessitatibus tenetur'+
    ' similique dolore. Debitis!',
    price,
    geometry: {
      type: "Point",
      coordinates: [
        cities[random1000].longitude,
        cities[random1000].latitude,
      ]
  },
    images: [
      {
        url: 'https://res.cloudinary.com/davcu5nbb/image/upload/v1676694600/YelpCamp/yyysqcon4vi9hfp0k0vr.jpg',
        filename: 'YelpCamp/yyysqcon4vi9hfp0k0vr',
      },
      {
        url: 'https://res.cloudinary.com/davcu5nbb/image/upload/v1676694601/YelpCamp/xpgg7nxxoyinhykibr8j.jpg',
        filename: 'YelpCamp/xpgg7nxxoyinhykibr8j',
      }
    ]
  })
  await camp.save()
}
}

seedDB().then(() => {
  mongoose.connection.close()
})