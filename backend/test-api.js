fetch('http://localhost:3000/api/predictions/run-batch/6588699e-87e6-497c-b684-b55fc0c90911', {
  method: 'POST',
  headers: {
    // Instructor account token, or we might need to query the DB to mock an instructor request.
    // Wait, the API has @UseGuards(JwtAuthGuard). I cannot just POST without a valid JWT!
  }
})
