# Getting Taystrades live (free, no coding)

Everything here is free. You only click around in websites; you never need a terminal.
Total cost: £0. A custom domain like taystrades.co.uk is optional and can come later (about £5 to £10 a year).

You'll go through four places: GitHub (where the code lives), eBay Developers (the key that lets the site read your listings), Cloudflare (hosting) and this chat (where you send me details).

---

## Part 1: Give me somewhere to put the code (GitHub, 5 minutes)

1. Go to **github.com/new** and sign in as taylorc9733.
2. Repository name: `taystrades-site`. Choose **Private**. Leave every other box unticked. Click **Create repository**.
3. Go to **github.com/apps/claude/installations/select_target**, pick your account, choose **Only select repositories**, tick `taystrades-site`, and click **Install** (or **Save**).
4. Tell me in the chat: "repo done".

I'll then put all the website code into it.

## Part 2: Start your eBay key (10 minutes, then sometimes a short wait)

Do this early, because eBay can take a little while to switch the key on.

1. Go to **developer.eBay.com**, click **Register**, and sign up using your normal eBay seller login.
2. Once in, open **Application Keys** (under your name, top right).
3. Give the app a name (for example `Taystrades website`) and click **Create a keyset** in the **Production** column.
4. eBay will ask about **Marketplace Account Deletion** notifications. Choose the option saying you **don't store eBay user data** (the exemption). Pick the reason "I do not persist eBay data" and submit.
5. Once the Production keyset shows, you'll see **App ID (Client ID)** and **Cert ID (Client Secret)**. Leave this tab open. You'll paste them into Cloudflare in Part 4.

Don't paste these two keys into this chat. They only go into Cloudflare.

## Part 3: Send me your real details

Reply here with:

- Town and county you're based in (exactly as on your Google Business Profile)
- WhatsApp number
- Email address for enquiries
- Your eBay username
- Opening hours
- Optional: your Google Business Profile **Maps link** and **review link** (in your profile, click "Ask for reviews" to get the review link)

## Part 4: Cloudflare (15 minutes, after I say the code is in GitHub)

### 4a. Make the storage box

1. In Cloudflare, open **Storage & Databases > Workers KV** (some accounts show it as **Workers & Pages > KV**).
2. Click **Create** (or **Create instance**), name it `TT_KV`, and create it.
3. Copy its **ID** (a long string of letters and numbers) and send it to me here. This one is fine to share.

I'll add it to the code. Wait for my "ready" before 4b.

### 4b. Put the website online

1. Go to **Workers & Pages > Create application**, choose the **Pages** tab, then **Import an existing Git repository** (or **Connect to Git**).
2. Connect your GitHub account when asked and pick `taystrades-site`.
3. Project name: `taystrades`. Framework preset: **None**. Build command: leave **empty**. Build output directory: `public`.
4. Click **Save and Deploy**. After a minute you'll get your address, for example **taystrades.pages.dev**. Send it to me.

### 4c. Switch on the hourly eBay sync

1. Go to **Workers & Pages > Create application**, stay on the **Workers** tab, and choose **Import a repository**.
2. Pick `taystrades-site` again.
3. Name the Worker `taystrades-sync` (it must match exactly). Set **Root directory** (or "Path") to `sync-worker`. Leave the deploy command as `npx wrangler deploy`.
4. Click **Deploy**.
5. When it finishes, open the new Worker (`taystrades-sync`), go to **Settings > Variables and Secrets**, click **Add**, choose type **Secret**, and add:
   - Name `EBAY_CLIENT_ID`, value: your eBay **App ID**
   - Name `EBAY_CLIENT_SECRET`, value: your eBay **Cert ID**
6. Click **Deploy** (or **Save and deploy**) so the secrets take effect.

The sync then runs at the start of every hour. Your real listings appear on the site after the next run.

### 4d. Free visitor stats

In your **taystrades** Pages project, open **Metrics** and click **Enable** under Web Analytics. It's free and cookie-free. It counts visits and pages, but not button taps.

## Part 5: Put it on Google

Once your real listings show on the site, add the address to your Google Business Profile under **Edit profile > Contact > Website**.

---

Until eBay is connected, the live site shows your categories and a "See our items on eBay" button instead of made-up stock, so it's safe to share straight away.
