const Campground = require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const {cloudinary} = require('../cloudinary')


module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({})
    res.render('./campground/index',{campgrounds})
  }

  module.exports.renderNewForm = (req,res) => {
    res.render('./campground/new')
  }

  module.exports.createNewCamp = async(req,res,next) => {
    const geoData = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
  }).send()

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
 


  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.auther = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash('success', 'Successfully made a new campground!');
  res.redirect(`/campground/${campground._id}`)
    }

    module.exports.showCamp = async (req, res,) => {
      const campground = await Campground.findById(req.params.id).populate({
          path: 'reviews',
          populate: {
              path: 'auther'
          }
      }).populate('auther');
      console.log(campground);
      if (!campground) {
          req.flash('error', 'Cannot find that campground!');
          return res.redirect('/campground');
      }
      res.render('campground/show', { campground });
  }
  module.exports.renderEditForm = async (req,res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
 
    if(!campground) {
      req.flash('error', 'Cannot find that campground')
      return res.redirect('/campground')
     }
    res.render('./campground/edit', {campground})
  }

  module.exports.updateCamp = async (req,res) => {
    const {id} = req.params
    console.log(req.body);
    const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs =  req.files.map(file => ({ url: file.path, filename: file.filename}))
    camp.images.push(...imgs)
   await camp.save()
   if(req.body.deleteImages) {
    for(let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename)  //delete the images from cloudinery
    }
    await camp.updateOne({$pull: {images: {filename: {  //delete from mongo
      $in:req.body.deleteImages
    }}}})
    console.log(camp);
   }
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campground/${camp._id}`)
  }
  
  module.exports.deleteCamp =  async (req,res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the campground ')
    res.redirect('/campground')
  }
 