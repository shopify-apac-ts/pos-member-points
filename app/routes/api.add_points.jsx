import { useEffect } from "react";
import { json, defer } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const body = await request.json();

  const points = body.points;
  const customerId = `gid://shopify/Customer/${body.customerId}`;

  console.log("points", points);
  console.log("customerId", customerId);

  //
  // Retrieve current points from the customer's metafield
  const customerQuery = await admin.graphql(
    `#graphql
      query {
        customer(id: "${customerId}") {
          metafield(namespace: "custom", key: "points") {
            value
            id
          }
        }
      }
    `,
  );
  const queryResult = await customerQuery.json();
  var currentPoints = Number(queryResult.data.customer.metafield.value);
  var metafieldId = queryResult.data.customer.metafield.id;
  console.log("currentPoints", currentPoints, metafieldId);

  //
  // Write in the new points
  currentPoints += Number(points);
  console.log("currentPoints + points", currentPoints);

  // Update the customer's metafield with the new points
  const updateQuery = await admin.graphql(
    `#graphql
      mutation updateCustomerMetafields($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            metafield(namespace: "custom", key: "points") {
              value
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          metafields: [
            {
              id: metafieldId,
              value: currentPoints.toString()
            }
          ],
          id: customerId
        }        
      }
    });

  const updateResult = await updateQuery.json();
  const updatedPoints = updateResult.data.customerUpdate.customer.metafield.value;
  console.log("updatedPoints", updatedPoints);

  return ( updatedPoints );
};

export default function AddPoints() {
  const updatedPoints = useActionData();
  console.log("We talked to backend!");

  return( updatedPoints );
}
