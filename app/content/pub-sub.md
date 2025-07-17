# Pub/Sub Logging

This page helps debug pub/sub notifications. To configure and use this, you must create a cloud datastore in your GCP project for this instance of the app.

## Steps to configure Cloud Datastore

1. Specify the [region](https://cloud.google.com/about/locations#regions) your app will run in your environmental variable `.env` file or configuration  (e.g. `us-east1`).
2. Create a Cloud Datastore database in [GCP](https://console.cloud.google.com/datastore/databases). 

!!! caution **Choose `Datastore mode` as the database type**
Datastore can run in multiple modes in GCP. This sample pub/sub logger is designed to work with Cloud Datastore's "Datastore" mode rather than the "Native" mode. While there are [many differences between the two modes](https://cloud.google.com/datastore/docs/firestore-or-datastore#in_datastore_mode), **this project uses Firestore in Datastore mode**.
!!!

3. [Deploy your copy of this application to AppEngine](https://cloud.google.com/appengine/docs/standard/nodejs/building-app/deploying-web-service). Since Cloud Pub/Sub can only hit public endpoints with data, you must have a publicly available app to receive the notifications and log them to Cloud Datastore. 

4. Configure a Pub/Sub topic and Subscription. 
    1. Please refer to the [devsite article on on handling Cloud Pub/Sub](https://developers.google.com/news/reader-revenue/monetization/sell/handle-pub-sub) for information oncreating a topic.
    2. When creating the subscription, configure it as a [Push Subscription](https://cloud.google.com/pubsub/docs/create-push-subscription#create_a_push_subscription), and set the **Endpoint URL** to `<Your-AppEngine-Url>.appspot.com/api/pub-sub/receive`.

After completing these steps, every time a notification is sent to the configured topic, the subscription will pick it up and push it to your application. The application then displays and stores it for future analysis. 

!!! hint **Real world usage**
There are many types of notifications that the configured topic will receive from Reader Revenue Manager: Enterprise. In a production environment, each type of notification would result in a different type of action (e.g. account creation, entitlement updates). This example serves only as a utility for easily viewing and debugging all pub/sub notifications.
!!!

This console displays all pub/sub notifications that your application processes and stores in Cloud Datastore. It polls this application's `/api/pub-sub/received` endpoint every second, and displays the new messages as they come in. 


### Pub/Sub

<div id=notificationsContainer>
    <div id="notificationsLog" style="overflow:scroll; max-height:500px;"></div>
</div>
