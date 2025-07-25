module.exports = (req, res) => {
  console.log('Simple API function called!');
  res.status(200).json({ message: 'Hello from Vercel Simple API!', path: req.url });
};