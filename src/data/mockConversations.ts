import type { Conversation } from '../types/messaging'

export const initialConversations: Conversation[] = [
  { id: 1, name: 'Ayesha Kapoor', initials: 'AK', color: 'stone', online: true, preview: 'Good night 🌙', time: '11:27 PM', unread: 1, messages: [
    { id: 1, text: 'Hey…', time: '10:58 PM' },
    { id: 2, text: 'Been thinking about something…', time: '10:59 PM' },
    { id: 3, text: 'You free to talk?', time: '10:59 PM' },
    { id: 4, text: 'Haan, I’m here ♡', time: '11:02 PM', mine: true, read: true },
    { id: 5, text: 'Kya hua?', time: '11:02 PM', mine: true, read: true },
    { id: 6, text: 'Nothing serious… just felt like talking to you. ❤️', time: '11:07 PM' },
    { id: 7, text: "Aww ♡\nI'm always here.", time: '11:10 PM', mine: true, read: true },
  ] },
  { id: 2, name: 'Rahul Mehta', initials: 'RM', color: 'graphite', online: false, preview: 'Bro, kal ka plan fix?', time: '9:08 PM', messages: [
    { id: 1, text: 'Bro, kal ka plan fix?', time: '9:08 PM' },
  ] },
  { id: 3, name: 'Ananya Das', initials: 'AD', color: 'fog', online: false, preview: '▧ Image', time: '12:47 PM', messages: [
    { id: 1, text: 'Sending you the references we talked about.', time: '12:42 PM' },
    { id: 2, text: 'Image', time: '12:47 PM', attachment: true },
  ] },
  { id: 4, name: 'Dev Patel', initials: 'DP', color: 'sand', online: true, preview: 'Okayy', time: '10:14 AM', messages: [
    { id: 1, text: 'Okayy', time: '10:14 AM' },
  ] },
  { id: 5, name: 'Mira Shah', initials: 'MS', color: 'moss', online: false, preview: 'I’ll send it over after lunch', time: 'Yesterday', messages: [
    { id: 1, text: 'I’ll send it over after lunch', time: 'Yesterday' },
  ] },
]
