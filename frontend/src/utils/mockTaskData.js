export const generateMockTaskData = (count = 50) => {
    const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
    const resources = ['Industrial Oven #1', 'Mixer A', 'Packaging Line B', 'Quality Station'];
    const taskTypes = ['Bake Morning Batch', 'Mix Ingredients', 'Package Products', 'Quality Check'];
    
    const mockTasks = [];
    
    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      
      const userRate = 15 + Math.random() * 25; // $15-40 per hour
      const loggedTimeMinutes = 30 + Math.random() * 300; // 30-330 minutes
      const laborCost = (userRate / 60) * loggedTimeMinutes;
      
      const resourceQty = 1 + Math.random() * 5; // 1-6 units
      const resourceCostPerUnit = 2 + Math.random() * 20; // $2-22 per unit
      const totalResourceCost = resourceQty * resourceCostPerUnit;
      
      const itemsProduced = Math.floor(50 + Math.random() * 450); // 50-500 items
      const costPerItem = (laborCost + totalResourceCost) / itemsProduced;
      
      // Generate date within last 30 days
      const completedOn = new Date();
      completedOn.setDate(completedOn.getDate() - Math.floor(Math.random() * 30));
      
      mockTasks.push({
        id: `task-${i + 1}`,
        title: `${taskType} #${i + 1}`,
        completedOn: completedOn.toISOString().split('T')[0],
        assignedUser: user,
        userRate: Number(userRate.toFixed(2)),
        loggedTimeMinutes: Math.floor(loggedTimeMinutes),
        laborCost: Number(laborCost.toFixed(2)),
        resourceUsed: resource,
        resourceAction: 'used',
        resourceQty: Number(resourceQty.toFixed(1)),
        resourceUnit: 'hours',
        resourceCost: Number(resourceCostPerUnit.toFixed(2)),
        totalResourceCost: Number(totalResourceCost.toFixed(2)),
        itemsProduced: itemsProduced,
        costPerItem: Number(costPerItem.toFixed(2))
      });
    }
    
    return mockTasks;
  };