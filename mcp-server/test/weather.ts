import { config } from 'dotenv';
import { weatherTool } from '../src/tools/weather.js';

config();
const result = await weatherTool.execute({ city: 'Tokyo' });
console.log(result);
