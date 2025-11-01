curl --location 'https://api.probe42.in/probe_pro/companies/U15549PN1992FTC065522/comprehensive-details' --header 'x-api-key: Replace this with your API Key' --header 'Accept: application/json' --header 'x-api-version: 1.3'

Pass the API key in the request header "x-api-key"
---
If you are sending too many requests too quickly, or limit exceeded, you will receive a 429 HTTP response.
---
The following are the typical error returned
400 -  Bad Request - Invalid URL - for eg., wrong query parameter.
403 -  Forbidden when there's no api-key supplied, incorrect api-key or an incorrect URL is given.
422 -  Validation errors - for eg., given a wrong CIN format.
404 -  when a resource is not found.
429 -  Credits are not sufficient to make this call, please purchase credits.
500 -  Any server side error.
502 -  timeout errors - if we have some issue in our backend systems.
504 -  AWS gateway timeout.
---
