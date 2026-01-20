const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/', (req, res) => {
  const body = req.body;
  const intentName = body.queryResult?.intent?.displayName || 'Necunoscut';
  const params = body.queryResult?.parameters || {};
  const session = body.session;

  if (intentName === 'Calcul - Cantitate') {
    const pizza = params.pizza_type;
    const marime = params.marime;
    const qty = Number(params.qty);

    console.log('PARAMS:', params);

    if (!pizza || !marime || !qty || qty <= 0) {
      return res.json({
        fulfillmentText: 'Te rog spune cantitatea (ex: 2), pizza și mărimea.'
      });
    }

    const preturi = {
      margherita: { mica: 20, medie: 28, mare: 35 },
      prosciutto: { mica: 23, medie: 31, mare: 38 },
      diavola: { mica: 24, medie: 32, mare: 40 },
      quattro_formaggi: { mica: 26, medie: 34, mare: 42 },
      vegetariana: { mica: 22, medie: 30, mare: 37 }
    };

    if (!preturi[pizza] || !preturi[pizza][marime]) {
      return res.json({
        fulfillmentText: 'Nu recunosc pizza sau mărimea. Exemplu: diavola mare.'
      });
    }

    const pretUnitar = preturi[pizza][marime];
    const subtotal = pretUnitar * qty;
    const transport = subtotal >= 100 ? 0 : 10;
    const reducere = qty >= 3 ? subtotal * 0.1 : 0;
    const total = subtotal + transport - reducere;

    const mesaj =
      `✅ Calcul comandă:\n` +
      `🍕 Pizza: ${pizza} (${marime})\n` +
      `🔢 Cantitate: ${qty}\n` +
      `💰 Preț unitar: ${pretUnitar} lei\n` +
      `📦 Subtotal: ${subtotal.toFixed(2)} lei\n` +
      `🚚 Transport: ${transport.toFixed(2)} lei\n` +
      `🏷 Reducere: ${reducere.toFixed(2)} lei\n` +
      `👉 Total: ${total.toFixed(2)} lei\n\n` +
      `Dorești să revii la meniul principal sau să oferi feedback?`;

    return res.json({
      fulfillmentText: mesaj,
      outputContexts: [
        { name: `${session}/contexts/secondary-menu`, lifespanCount: 5 }
      ]
    });
  }

  res.json({ fulfillmentText: 'Webhook activ, dar intent nerecunoscut.' });
});

app.listen(PORT, () => {
  console.log(`Server live pe portul ${PORT}`);
});
