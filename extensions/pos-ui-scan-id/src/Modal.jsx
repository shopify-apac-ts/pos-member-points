import {
  useEffect, 
  useState,
  React,
} from 'react'

import { 
  CameraScanner,
  Text, 
  Screen, 
  useApi,
  useCartSubscription,
  useScannerDataSubscription,
  reactExtension 
} from '@shopify/ui-extensions-react/point-of-sale'

const Modal = () => {
  const {data} = useScannerDataSubscription();
  const cart = useCartSubscription();
  const api = useApi();
  const [customerStatus, setCustomerStatus] = useState('not scanned');

  // Use an effect to add the scanned customer to the cart when data changes
  useEffect(() => {
    // Associate customer with cart
    // This logic assumes to get the number part of the customer ID
    const addCustomerToCart = (data) => {
      if (data) {
        api.cart.removeCustomer();
        api.cart.setCustomer({ id: Number(data) })
        .then(() => { setCustomerStatus(`success!`); })
        .catch(() => { setCustomerStatus(`error: customer not found`); });
      }
    };
    addCustomerToCart(data);
  }, [data]);
  
  return (
    <Screen
      name="CameraScanner"
      title="会員IDをスキャンする"
    >
      <CameraScanner />
      <Text variant="headingLarge"> Status: {customerStatus}</Text>
      <Text variant="captionRegular">Customer: {cart?.customer?.email} ID: {cart?.customer?.id}</Text>
      <Text variant="captionRegular">Scanned data: {data}</Text>
    </Screen>
  )
}

export default reactExtension('pos.home.modal.render', () => <Modal />);