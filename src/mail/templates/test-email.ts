require('dotenv').config({ path: '.env' });
import { send } from '../mail';

(async function sampleSend() {
	// send email to the new user
	try {
		await send({
			filename: 'test-email',
			to: 'setemiojo@gmail.com',
			subject: 'Test Email',
			title: 'Testing Email on FBN Domains',
			name: 'setemi ojo',
			companyName: 'dev Team',
			resetLink: 'https://chooselifewellness.co?token=abc123',
			activateLink: 'https://chooselifewellness.co?token=abc123',
			loginLink: 'https://chooselifewellness.co?token=abc123',
			description: 'description',
			datetime: '12/02/1993',
			professional: 'Dr Sohci',
			type: 'Done',
			purpose: 'We need to eat',
		});
		console.log('Email Sent 💌');
	} catch (error) {
		console.error('some dangerous happened');
	}
})();
