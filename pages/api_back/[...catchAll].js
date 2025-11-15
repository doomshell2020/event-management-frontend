// pages/api/[...catchAll].js
export default function handler(req, res) {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
}
