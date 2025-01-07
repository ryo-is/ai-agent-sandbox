import type { ToolHandler } from '../types.js';

interface WeatherResponse {
	weather: Array<{
		description: string;
	}>;
	main: {
		temp: number;
		humidity: number;
	};
}

export const weatherTool: ToolHandler = {
	definition: {
		name: 'weather',
		description:
			'指定された都市の天気情報を取得します。cityというパラメータが必要です。cityにはローマ字、または英語でパラメータを渡してください。',
		inputSchema: {
			type: 'object',
			properties: {
				city: {
					type: 'string',
					description: '都市名（例：Tokyo, London, New York）',
				},
			},
			required: ['city'],
		},
	},

	async execute(args: Record<string, unknown>) {
		const city = args.city as string;
		const apiKey = process.env.OPENWEATHER_API_KEY;

		if (!apiKey) {
			throw new Error('OpenWeatherMap APIキーが設定されていません。');
		}

		try {
			const response = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ja`,
			);

			if (!response.ok) {
				throw new Error(
					'天気情報の取得に失敗しました。指定された都市が見つからない可能性があります。',
				);
			}

			const data = (await response.json()) as WeatherResponse;
			const weather = data.weather[0];
			const main = data.main;

			return {
				content: [
					{
						type: 'text',
						text: `${city}の天気:\n現在の天気: ${weather.description}\n気温: ${main.temp}°C\n湿度: ${main.humidity}%`,
					},
				],
			};
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`天気情報の取得中にエラーが発生しました: ${error.message}`,
				);
			}
			throw new Error('天気情報の取得中に予期せぬエラーが発生しました。');
		}
	},
};

export default weatherTool;
