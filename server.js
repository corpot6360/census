require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/census';

const censusSchema = new mongoose.Schema(
  {
    numberOfPeople: {
      type: Number,
      required: true,
      min: 0
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true, uppercase: true },
      zip: { type: String, required: true, trim: true }
    },
    year: {
      type: Number,
      required: true,
      min: 1800,
      max: 2100
    },
    censusTaker: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Census = mongoose.model('Census', censusSchema);

app.use(cors());
app.use(express.json());

app.get('/api/census', async (request, response, next) => {
  try {
    const records = await Census.find().sort({ year: -1, createdAt: -1 });
    response.json(records);
  } catch (error) {
    next(error);
  }
});

app.post('/api/census', async (request, response, next) => {
  try {
    const record = await Census.create(request.body);
    response.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

app.put('/api/census/:id', async (request, response, next) => {
  try {
    const record = await Census.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });

    if (!record) {
      response.status(404).json({ message: 'Census record not found' });
      return;
    }

    response.json(record);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/census/:id', async (request, response, next) => {
  try {
    const record = await Census.findByIdAndDelete(request.params.id);

    if (!record) {
      response.status(404).json({ message: 'Census record not found' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

const staticRootCandidates = [
  path.join(__dirname, 'dist', 'census', 'browser'),
  path.join(__dirname, 'dist', 'census')
];

for (const staticRoot of staticRootCandidates) {
  if (fs.existsSync(staticRoot)) {
    app.use(express.static(staticRoot));
    app.get('*', (request, response) => {
      response.sendFile(path.join(staticRoot, 'index.html'));
    });
    break;
  }
}

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const message = error && error.message ? error.message : 'Server error';
  response.status(500).json({ message });
});

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Census app listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});