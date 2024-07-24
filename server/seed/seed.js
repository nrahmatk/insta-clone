if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { MongoClient, ObjectId } = require("mongodb");
const { hashPassword } = require("../helpers/bcrypt");

const uri = process.env.MONGO_URI; // Gunakan URI MongoDB dari environment variable
const client = new MongoClient(uri);

const user = [
  {
    name: "Budi Santoso",
    username: "budisantoso",
    email: "budi@mail.com",
    bio: "Orang biasa yang suka ketawa",
    imgUrl: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Siti Aminah",
    username: "sitiaminah",
    email: "siti@mail.com",
    bio: "Hobi jalan-jalan",
    imgUrl: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Agus Wijaya",
    username: "aguswijaya",
    email: "agus@mail.com",
    bio: "Penggemar kuliner",
    imgUrl: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Dewi Lestari",
    username: "dewilestari",
    email: "dewi@mail.com",
    bio: "Pecinta teknologi",
    imgUrl: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Rudi Hartono",
    username: "rudihartono",
    email: "rudi@mail.com",
    bio: "Fotografer amatir",
    imgUrl: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Indra Saputra",
    username: "indrasaputra",
    email: "indra@mail.com",
    bio: "Penggila bola",
    imgUrl: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    name: "Lina Susanti",
    username: "linasusanti",
    email: "lina@mail.com",
    bio: "Penggemar basket",
    imgUrl: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    name: "Tono Gunawan",
    username: "tonogunawan",
    email: "tono@mail.com",
    bio: "Atlet lari",
    imgUrl: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    name: "Ayu Lestari",
    username: "ayulestari",
    email: "ayu@mail.com",
    bio: "Hobi berenang",
    imgUrl: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    name: "Eko Purnomo",
    username: "ekopurnomo",
    email: "eko@mail.com",
    bio: "Pemain badminton",
    imgUrl: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    name: "Rina Wati",
    username: "rinawati",
    email: "rina@mail.com",
    bio: "Pecinta sepakbola",
    imgUrl: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    name: "Dani Prasetyo",
    username: "daniprasetyo",
    email: "dani@mail.com",
    bio: "Penggemar voli",
    imgUrl: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    name: "Yuli Hartati",
    username: "yulihartati",
    email: "yuli@mail.com",
    bio: "Pemain tenis",
    imgUrl: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    name: "Fajar Nugroho",
    username: "fajarnugroho",
    email: "fajar@mail.com",
    bio: "Pelari maraton",
    imgUrl: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    name: "Rani Amalia",
    username: "raniamalia",
    email: "rani@mail.com",
    bio: "Atlet senam",
    imgUrl: "https://randomuser.me/api/portraits/women/7.jpg",
  },
];

const userDocuments = user.map((user) => ({
  _id: new ObjectId(),
  name: user.name,
  username: user.username,
  email: user.email,
  password: hashPassword("12345"),
  bio: user.bio,
  imgUrl: user.imgUrl,
}));

const posts = [
  {
    _id: new ObjectId(),
    content: "Latihan bola hari ini sangat seru!",
    tags: ["#latihan", "#bola", "#seru"],
    imgUrl:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=640&fm=jpg",
    authorId: userDocuments[0]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Lari pagi di taman, segar sekali!",
    tags: ["#lari", "#taman", "#segar"],
    imgUrl:
      "https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?q=80&w=640&fm=jpg",
    authorId: userDocuments[1]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Pertandingan basket kemarin menegangkan!",
    tags: ["#pertandingan", "#basket", "#menegangkan"],
    imgUrl:
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?q=80&w=640&fm=jpg",
    authorId: userDocuments[2]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Main badminton bareng teman-teman",
    tags: ["#badminton", "#teman"],
    imgUrl:
      "https://images.unsplash.com/photo-1626225015999-2e53f6aaa008?q=80&w=640&fm=jpg",
    authorId: userDocuments[3]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Renang di kolam favoritku",
    tags: ["#renang", "#kolam"],
    imgUrl:
      "https://images.unsplash.com/photo-1520322082799-20c1288346e3?q=80&w=640&fm=jpg",
    authorId: userDocuments[4]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Sepakbola sore ini sangat menyenangkan",
    tags: ["#sepakbola", "#menyenangkan"],
    imgUrl:
      "https://images.unsplash.com/photo-1683033316972-62d7eac88bec?q=80&w=640&fm=jpg",
    authorId: userDocuments[5]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Voli pantai dengan pemandangan indah",
    tags: ["#voli", "#pantai"],
    imgUrl:
      "https://images.unsplash.com/photo-1519046947096-f43d6481532b?q=80&w=640&fm=jpg",
    authorId: userDocuments[6]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Tenis lapangan di pagi hari",
    tags: ["#tenis", "#lapangan"],
    imgUrl:
      "https://images.unsplash.com/photo-1598552133129-c5c474a8414d?q=80&w=640&fm=jpg",
    authorId: userDocuments[7]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Maraton di kota, pengalaman luar biasa!",
    tags: ["#maraton", "#kota"],
    imgUrl:
      "https://images.unsplash.com/photo-1613936360976-8f35cf0e5461?q=80&w=640&fm=jpg",
    authorId: userDocuments[8]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    content: "Latihan senam pagi ini menyegarkan",
    tags: ["#latihan", "#senam"],
    imgUrl:
      "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=640&fm=jpg",
    authorId: userDocuments[9]._id,
    comments: [],
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const follow = [
  {
    _id: new ObjectId(),
    followingId: userDocuments[0]._id,
    followerId: userDocuments[1]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[1]._id,
    followerId: userDocuments[2]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[2]._id,
    followerId: userDocuments[3]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[3]._id,
    followerId: userDocuments[4]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[4]._id,
    followerId: userDocuments[5]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[5]._id,
    followerId: userDocuments[6]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[6]._id,
    followerId: userDocuments[7]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[7]._id,
    followerId: userDocuments[8]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[8]._id,
    followerId: userDocuments[9]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[9]._id,
    followerId: userDocuments[10]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[10]._id,
    followerId: userDocuments[11]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[11]._id,
    followerId: userDocuments[12]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[12]._id,
    followerId: userDocuments[13]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[13]._id,
    followerId: userDocuments[14]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    followingId: userDocuments[14]._id,
    followerId: userDocuments[0]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    await client.connect();
    const database = client.db("insta");
    const userCollection = database.collection("user");
    const postsCollection = database.collection("posts");
    const followCollection = database.collection("follow");

    await userCollection.insertMany(userDocuments);
    await postsCollection.insertMany(posts);
    await followCollection.insertMany(follow);

    console.log("Database seeded successfully!");
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
