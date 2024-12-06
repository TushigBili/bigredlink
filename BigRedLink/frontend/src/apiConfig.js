// Define the base URL for the API
// This constant holds the URL where the backend server is running.
// It serves as the base endpoint for all API requests from the frontend to the backend.
// This helps in managing API endpoints centrally, allowing for easier updates if the backend address changes.

const BASE_URL = 'http://localhost:8000/api';

// Export the base URL
// By exporting this constant, it can be easily imported and used in other parts of the frontend
// for making API requests to interact with the backend (e.g., login, register, etc.).
export default BASE_URL;
