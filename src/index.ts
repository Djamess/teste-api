require('dotenv').config();
import express, { Request, Response } from 'express';
import axios from 'axios';
import url from 'url';

const PORT = process.env.PORT || 3001;

const app = express();

let accessToken = '';
let refreshToken = '';

// TESTAR
app.get('/api/auth/discord/redirect', async (req: Request, res: Response) => {
	const { code } = req.query;
	if (code) {
		try {
			const formData = new url.URLSearchParams({
				cliend_id: '937086708040736808',
				client_secret: 'FfdV0_zF8vW6G9wHumcds_ISu9ls8LVn',
				grant_type: 'authorization_code',
				code: code.toString(),
				redirect_uri: 'https://localhost:3001/api/auth/discord/redirect',
			});
			const response = await axios.post(
				'https://discord.com/api/v8/oauth2/token',
				formData.toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			const { access_token, refresh_token } = response.data
			console.log(access_token, refresh_token);
			accessToken = access_token
			refreshToken = refresh_token
			const { data: userResponse } = await axios.get(
				'https://discord.com/api/v8/users/@me',
				{
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				}
			);
			res.send(userResponse);
		} catch (err) {
			console.log(err);
			res.sendStatus(400);
		}
	}
});

// CONSEGUE AS INFORMAÇÕES DO USUÁRIO
app.get('api/auth/user', async (req: Request, res: Response) => {
	try {
		const response = await axios.get('https://discord.com/api/v8/users/@me', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
		})
		res.send(response.data)
	} catch (err) {
		console.log(err)
		res.sendStatus(400)
	}
});

// REVOGA O ACESSO DO APLICATIVO AO DISCORD
app.get('/api/auth/revoke', async (req: Request, res: Response) => {
	const formData = new url.URLSearchParams({
		cliend_id: '937086708040736808',
		client_secret: 'FfdV0_zF8vW6G9wHumcds_ISu9ls8LVn',
		token: accessToken,
	})
	try {
		const response = await axios.post(
			'https://discord.com/api/v8/oauth2/token/revoke',
			formData.toString(),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		)

		res.send(response.data)
	} catch (err) {
		console.log(err)
		res.sendStatus(400)
	}
});

console.log(process.env.CLIENT_ID);
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))
// https://discord.com/api/oauth2/authorize?client_id=937086708040736808&redirect_uri=https%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fdiscord%2Fredirect&response_type=code&scope=identify%20activities.read