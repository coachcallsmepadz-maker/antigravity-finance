import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const BASIQ_API_URL = 'https://au-api.basiq.io';

// Cache for Basiq access token
let cachedToken = null;
let tokenExpiry = null;

// Get Basiq access token
async function getBasiqToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      `${BASIQ_API_URL}/token`,
      'scope=SERVER_ACCESS',
      {
        headers: {
          'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'basiq-version': '3.0'
        }
      }
    );

    cachedToken = response.data.access_token;
    // Token expires in 1 hour, refresh 5 mins early
    tokenExpiry = Date.now() + (55 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('Failed to get Basiq token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Basiq');
  }
}

// Create a Basiq user
app.post('/api/basiq/users', async (req, res) => {
  try {
    const token = await getBasiqToken();
    const { email, mobile } = req.body;

    const response = await axios.post(
      `${BASIQ_API_URL}/users`,
      { email, mobile },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'basiq-version': '3.0'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to create user:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Create a consent/auth link for user to connect their bank
app.post('/api/basiq/auth-link', async (req, res) => {
  try {
    const token = await getBasiqToken();
    const { userId } = req.body;

    // Create a client token for the Consent UI
    const response = await axios.post(
      `${BASIQ_API_URL}/token`,
      `scope=CLIENT_ACCESS&userId=${userId}`,
      {
        headers: {
          'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'basiq-version': '3.0'
        }
      }
    );

    res.json({
      clientToken: response.data.access_token,
      userId
    });
  } catch (error) {
    console.error('Failed to create auth link:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create auth link' });
  }
});

// Get user's connections (linked banks)
app.get('/api/basiq/users/:userId/connections', async (req, res) => {
  try {
    const token = await getBasiqToken();
    const { userId } = req.params;

    const response = await axios.get(
      `${BASIQ_API_URL}/users/${userId}/connections`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to get connections:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get connections' });
  }
});

// Get user's accounts
app.get('/api/basiq/users/:userId/accounts', async (req, res) => {
  try {
    const token = await getBasiqToken();
    const { userId } = req.params;

    const response = await axios.get(
      `${BASIQ_API_URL}/users/${userId}/accounts`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to get accounts:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
});

// Get user's transactions
app.get('/api/basiq/users/:userId/transactions', async (req, res) => {
  try {
    const token = await getBasiqToken();
    const { userId } = req.params;
    const { limit = 500 } = req.query;

    const response = await axios.get(
      `${BASIQ_API_URL}/users/${userId}/transactions?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Failed to get transactions:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Basiq API server running on http://localhost:${PORT}`);
});
