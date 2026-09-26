// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://10.109.67.63:4000';

export default function HomeScreen() {
  const [leads, setLeads] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('leads:init', (data) => {
      setLeads(data);
    });

    socket.on('leads:new', (newLead) => {
      setLeads((prev) => [newLead, ...prev]);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {connected ? 'Live Leads' : 'Connecting...'}
      </Text>

      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
  {item.fields?.full_name || 'No Name'}
</Text>

<Text>
  {item.fields?.email || 'No Email'}
</Text>

<Text style={styles.time}>
  {item.createdTime}
</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  name: { fontWeight: 'bold' },
  time: { fontSize: 12, color: 'gray' },
});