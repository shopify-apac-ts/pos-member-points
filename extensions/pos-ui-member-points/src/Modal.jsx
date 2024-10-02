import React, { useEffect, useState } from 'react';
import { 
  NumberField,
  Screen,
  ScrollView, 
  Text, 
  useApi, 
  useCartSubscription,
  reactExtension 
} from '@shopify/ui-extensions-react/point-of-sale';

const SERVER_URL = "insulation-cameroon-murphy-comparison.trycloudflare.com";

const SmartGridModal = () => {

  const api = useApi();
  const cart = useCartSubscription();

  const [number, setNumber] = useState('');
//  const [authenticated, setAuthenticated] = useState('');
  const [error, setError] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [result, setResult] = useState('not yet added');

  const AddPoints = ( points, memberId ) => {
    api.session.getSessionToken().then((token) => {
      setSessionToken(token);
      fetch(`https://${SERVER_URL}/api/add_points`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points: points, customerId: memberId }),
      })
      .then((response) => {
        setResult(response.status === 200 ? "success!" : "error");
      })
      .catch(setError);
    });
  }

  return (
    <Screen name='Add Points' title='Add Points'>
      <ScrollView>
        <NumberField
          label="加算するポイント数"
          placeholder="0"
          helpText="ポイント加算数を入力してください。"
          value={number}
          onChange= { (value) => setNumber(value) }
          required={true}
          action={{
            label: 'Add Points!',
            onPress: () => {
              AddPoints(number, cart?.customer?.id);
              setNumber('');
            },
          }}
        />
        <Text variant="headingLarge">Result: {result}</Text>
        <Text variant="captionRegular">Value: {number}</Text>
        <Text variant="captionRegular">Customer: {cart?.customer?.email} ID: {cart?.customer?.id}</Text>
        <Text variant="captionRegular">Error: {error}</Text>
      </ScrollView>
    </Screen>
  );
}

/*
<Text>Token: {sessionToken}</Text>
<Text>Authenticated: {authenticated}</Text>
<Text>Error: {error}</Text>
*/

export default reactExtension('pos.home.modal.render', () => {
  return <SmartGridModal />
});

