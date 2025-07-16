const { db } = require('../config/couchdb'); // Import CouchDB instance

const decrementMaterialCount = async (materialIds) => {
  for (const materialId of materialIds) {
    // Fetch the material document by its ID
    const materialDoc = await db.get(materialId);

    if (!materialDoc) {
      throw new Error(`Material not found: ${materialId}`);
    }

    if (materialDoc.type !== 'material') {
      throw new Error(`Document is not a material: ${materialId}`);
    }

    // Define a default amount required or handle dynamically (1 is used here as an example)
    const amountRequired = 1; // You can replace this with a derived value if needed

    if (materialDoc.amount_available < amountRequired) {
      throw new Error(
        `Insufficient material: ${materialDoc.material_name} `
        //(Required: ${amountRequired}, Available: ${materialDoc.amount_available})
      );
    }

    // Decrement the material amount
    materialDoc.amount_available -= amountRequired;
    materialDoc.updated_at = new Date().toISOString();

    // Save the updated document back to the database
    await db.insert(materialDoc);
  }
};

const incrementMaterialCount = async (materialIds) => {
  for (const materialId of materialIds) {
    // Fetch the material document by its ID
    const materialDoc = await db.get(materialId);
     
    if (!materialDoc) {
      throw new Error(`Material not found: ${materialId}`);
    }

    if (materialDoc.type !== 'material') {
      throw new Error(`Document is not a material: ${materialId}`);
    }

    // Define a default amount or handle dynamically (1 is used here as an example)
    const amountRequired = 1; // You can replace this with a derived value if needed

    // Increment the material amount
    materialDoc.amount_available += amountRequired;
    materialDoc.updated_at = new Date().toISOString();
    console.log("materialDoc",materialDoc)
    // Save the updated document back to the database
    await db.insert(materialDoc);
  }
};

  module.exports={
    decrementMaterialCount,
    incrementMaterialCount
  }