const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Voter = require('./models/Voter');
const Candidate = require('./models/Candidate');
const Election = require('./models/Election');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evoting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample data
const voters = [
  {
    voterId: 'admin123',
    password: 'admin123',
    name: 'Admin User',
    isAdmin: true,
    hasVoted: false
  },
  {
    voterId: 'voter1',
    password: 'voter123',
    name: 'John Doe',
    isAdmin: false,
    hasVoted: false
  },
  {
    voterId: 'voter2',
    password: 'voter123',
    name: 'Jane Smith',
    isAdmin: false,
    hasVoted: false
  },
  {
    voterId: 'voter3',
    password: 'voter123',
    name: 'Bob Johnson',
    isAdmin: false,
    hasVoted: false
  }
];

const candidates = [
  {
    name: 'Alice Brown',
    party: 'Progressive Party',
    position: 'President',
    description: 'Experienced leader with a focus on technological innovation.'
  },
  {
    name: 'Charlie Davis',
    party: 'Conservative Union',
    position: 'President',
    description: 'Dedicated to traditional values and economic stability.'
  },
  {
    name: 'Eva Garcia',
    party: 'Centrist Alliance',
    position: 'President',
    description: 'Bringing people together with moderate policies.'
  }
];

const elections = [
  {
    title: 'Presidential Election 2023',
    description: 'National election for the office of President',
    isActive: false,
    startDate: null,
    endDate: null
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Voter.deleteMany({});
    await Candidate.deleteMany({});
    await Election.deleteMany({});

    console.log('Database cleared');

    // Add voters
    const createdVoters = await Voter.create(voters);
    console.log(`${createdVoters.length} voters created`);

    // Add candidates
    const createdCandidates = await Candidate.create(candidates);
    console.log(`${createdCandidates.length} candidates created`);

    // Add election with candidates
    const election = new Election(elections[0]);
    election.candidates = createdCandidates.map(candidate => candidate._id);
    await election.save();
    console.log(`Election created with ${election.candidates.length} candidates`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();