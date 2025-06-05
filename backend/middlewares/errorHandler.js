export default function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Server error' });
}
