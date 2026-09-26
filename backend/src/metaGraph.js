const axios = require('axios');

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v20.0';

async function fetchLeadDetails(leadgenId, pageAccessToken) {
  if (!pageAccessToken) {
    return mockLead(leadgenId);
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}`;

  const response = await axios.get(url, {
    params: {
      access_token: pageAccessToken,
      fields: 'id,created_time,ad_id,ad_name,form_id,field_data,is_organic',
    },
  });

  return normalizeLead(response.data);
}

function mockLead(leadgenId) {
  return {
    id: leadgenId,
    createdTime: new Date().toISOString(),
    adId: 'mock_ad',
    adName: 'Test Ad',
    formId: 'mock_form',
    isOrganic: false,
    fields: {
      full_name: 'Test User',
      email: 'test@example.com',
      phone_number: '9999999999',
    },
  };
}

function normalizeLead(rawLead) {
  const fields = {};

  (rawLead.field_data || []).forEach((f) => {
    fields[f.name] = f.values?.[0] || null;
  });

  return {
    id: rawLead.id,
    createdTime: rawLead.created_time,
    adId: rawLead.ad_id,
    adName: rawLead.ad_name,
    formId: rawLead.form_id,
    isOrganic: rawLead.is_organic,
    fields,
  };
}

module.exports = { fetchLeadDetails };