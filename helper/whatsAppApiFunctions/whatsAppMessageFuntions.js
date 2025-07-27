// whatsappAPI.js

import { client } from '../../whatsApp/whatsappClientInitialization.js';

// Function to send a WhatsApp message to an individual
export const sendMessage = async (number, message) => {
  const chatId = `${number.replace('+', '')}@c.us`;

  try {
    console.log("CHAT ID : ", chatId)
    const contact = await client.getNumberId(number);
    console.log("CONTACT : ", contact)
    if (!contact) {
      throw new Error(`The number ${number} is not registered on WhatsApp.`);
    }

    await client.sendMessage(contact._serialized, message);
    console.log(`Message sent to ${number}: ${message}`);
    return { success: true, message: 'Message sent successfully.' };
  } catch (error) {
    console.error(`Error sending message to ${chatId}:`, error.message);
    return { success: false, error: `Failed to send message: ${error.message}` };
  }
};

// Function to send a message to a WhatsApp group using its unique ID
export const sendGroupMessage = async (groupName, message) => {
    try {
      // Fetch all chats
      const chats = await client.getChats();
  
      // Log the total number of groups found
    //   console.log(`Total chats fetched: ${chats.length}`);
  
      // Find the group by unique ID instead of name
      const groupChat = chats.find(
        (chat) => chat.isGroup && chat.name.trim().toLowerCase() === groupName.trim().toLowerCase()
      );
  
      if (!groupChat) {
        console.error(`Group "${groupName}" not found.`);
        return { success: false, error: `Group "${groupName}" not found.` };
      }
  
      // Log the found group details
    //   console.log(`Found group: ${groupChat.name} with ID: ${groupChat.id._serialized}`);
  
      // Send the message to the group using its unique ID
      await client.sendMessage(groupChat.id._serialized, message);
      console.log(`Message sent to group "${groupName}": ${message}`);
      return { success: true, message: 'Message sent to group successfully.' };
    } catch (error) {
      console.error(`Error sending message to group "${groupName}":`, error.message);
      return { success: false, error: `Failed to send message to group: ${error.message}` };
    }
  };


  // Function to send a message to a WhatsApp group using its unique Group ID
export const sendMessageToGroupById = async (groupId, message) => {
  try {
    // Send the message directly using the group ID
    await client.sendMessage(groupId, message);
    console.log(`Message sent to group with ID: ${groupId}`);
    return { success: true, message: 'Message sent to group successfully.' };
  } catch (error) {
    console.error(`Error sending message to group with ID "${groupId}":`, error.message);
    return { success: false, error: `Failed to send message to group: ${error.message}` };
  }
};




// Function to get all group IDs
export const getAllGroupIds = async () => {
  try {
    // Fetch all chats associated with the client
    const chats = await client.getChats();

    // Filter out the group chats
    const groupChats = chats.filter((chat) => chat.isGroup);

    // Map to extract group names and IDs
    const groups = groupChats.map((group) => ({
      name: group.name,
      id: group.id._serialized, // This is the unique group ID
    }));

    console.log('Groups found:', groups);

    return groups; // Returning the list of group names and their unique IDs
  } catch (error) {
    console.error('Error fetching group IDs:', error.message);
    return [];
  }
};