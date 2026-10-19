const Wishlist=require("../models/wishlist.model");
const addToWishlist=async(req,res)=>{try{await Wishlist.add(req.user.user_id,req.body.product_id);res.status(201).json({success:true,message:"Product added to wishlist."});}catch(e){res.status(400).json({success:false,message:e.message});}};
const getWishlist=async(req,res)=>{try{res.json({success:true,items:await Wishlist.getUserWishlist(req.user.user_id)});}catch(_){res.status(500).json({success:false,message:"Failed to fetch wishlist."});}};
const removeFromWishlist=async(req,res)=>{try{await Wishlist.remove(req.user.user_id,req.params.productId);res.json({success:true,message:"Product removed from wishlist."});}catch(_){res.status(500).json({success:false,message:"Failed to remove wishlist item."});}};
const clearWishlist=async(req,res)=>{try{await Wishlist.clear(req.user.user_id);res.json({success:true,message:"Wishlist cleared successfully."});}catch(_){res.status(500).json({success:false,message:"Failed to clear wishlist."});}};
module.exports={addToWishlist,getWishlist,removeFromWishlist,clearWishlist};
