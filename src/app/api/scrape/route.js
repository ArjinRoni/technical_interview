import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request) {
  const { url } = await request.json();
  
  try {
    const response = await axios.get(url);
    const html = response.data;

    if (!html) {
      throw new Error('No HTML content received');
    }

    const $ = cheerio.load(html);
    
    const productName = $('h1.text-huge.text-gray-600.font-bold').text().trim();
    const originalPrice = $('.text-lg.text-gray-400.line-through').text().trim();
    const currentPrice = $('.text-4xl.font-bold.mb-2.text-gray-600').text().trim();
    const color = $('p:contains("Renk") span').text().trim();
    const imageUrl = $('.w-full.h-147.border.rounded-md.overflow-hidden img').attr('src');
    const description = $('#product-detail .rendered-html.text-xxs').text().trim() || 
                        $('div[data-v-5bd71c3a] .rendered-html.text-xxs').first().text().trim();

    const features = [];
    $('.border.rounded.px-3.pb-3.flex.justify-between.flex-wrap .flex.justify-between.border-b.py-3.text-xxs').each((i, el) => {
      const featureName = $(el).find('span:first-child').text().trim();
      const featureValue = $(el).find('span:last-child').text().trim();
      features.push({ name: featureName, value: featureValue });
    });

    const categoryElements = $('ul.flex.mb-8.mt-5\\.5.-mlb-3\\.5 a.text-gray-400.text-xs.font-semibold, ul.flex.mb-8.mt-5\\.5.-mlb-3\\.5 a.text-gray-600.text-xs.font-semibold');
    const category = categoryElements.map((i, el) => $(el).text().trim()).get().slice(-3).join(' // ');

    const productInfo = {
      productName,
      originalPrice,
      currentPrice,
      color,
      imageUrl,
      description,
      features,
      category
    };
    
    return NextResponse.json({ success: true, data: productInfo });
  } catch (error) {
    console.error('Error scraping URL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}