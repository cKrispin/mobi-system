export function routePrompt(
  departure,
  destination
) {

  return `
You are a transport expert.

Departure:
${departure}

Destination:
${destination}

Provide:

1. Recommended route
2. Estimated duration
3. Estimated cost
4. Traffic warning
5. Alternative route

Respond in French.
`;

}