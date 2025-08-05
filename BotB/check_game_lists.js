const { MongoClient } = require('mongodb');

async function checkGameListsCollection() {
  const uri = 'mongodb://cryptouser:Q21K9WF7g1ssmQa447@ugcrypto-center-db-system.mongodb.singapore.rds.aliyuncs.com:3717/';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Access the V5DB_MEMBER database
    const db = client.db('V5DB_MEMBER');
    console.log('📁 Accessing V5DB_MEMBER database');

    // Check for game_lists collection (plural)
    const collection = db.collection('game_lists');
    console.log('📋 Accessing game_lists collection (plural)');

    // Count documents in the game_lists collection
    const gameCount = await collection.countDocuments();
    console.log(`🎮 Total number of games in game_lists collection: ${gameCount}`);

    // Get collection stats
    if (gameCount > 0) {
      const stats = await db.command({ collStats: 'game_lists' });
      console.log(`\n📊 Collection Statistics:`);
      console.log(`- Total documents: ${stats.count}`);
      console.log(`- Average document size: ${Math.round(stats.avgObjSize)} bytes`);
      console.log(`- Total collection size: ${Math.round(stats.size / 1024)} KB`);

      // Show sample games
      console.log('\n📄 Sample games (first 3):');
      const sampleGames = await collection.find({}).limit(3).toArray();
      
      sampleGames.forEach((game, index) => {
        console.log(`\n--- Game ${index + 1} ---`);
        console.log(`Slug: ${game.slug}`);
        console.log(`Status: ${game.status}`);
        console.log(`Brand: ${game.brand_slug}`);
        console.log(`Category: ${game.category_code}`);
        console.log(`Provider: ${game.provider_code}`);
        console.log(`Has Demo: ${game.has_demo}`);
        if (game.name) {
          console.log(`Name: ${JSON.stringify(game.name)}`);
        }
      });

      // Count by status
      const activeGames = await collection.countDocuments({ status: 1 });
      const inactiveGames = await collection.countDocuments({ status: 0 });
      console.log(`\n📈 Game Status Breakdown:`);
      console.log(`- Active games (status: 1): ${activeGames}`);
      console.log(`- Inactive games (status: 0): ${inactiveGames}`);

      // Count by provider
      const providers = await collection.distinct('provider_code');
      console.log(`\n🎰 Game Providers:`);
      console.log(`- Total providers: ${providers.length}`);
      console.log(`- Providers: ${providers.slice(0, 10).join(', ')}${providers.length > 10 ? '...' : ''}`);

      // Count by category
      const categories = await collection.distinct('category_code');
      console.log(`\n📂 Game Categories:`);
      console.log(`- Total categories: ${categories.length}`);
      console.log(`- Categories: ${categories.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

checkGameListsCollection().catch(console.error);