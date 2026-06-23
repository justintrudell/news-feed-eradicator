import { regionId, siteId, type Site } from "../types/sitelist";

const site: Site = {
	id: siteId('hckrnews'),
	title: 'Hckr News',
	hosts: ['hckrnews.com', 'www.hckrnews.com'],
	paths: ['/', '/index.html'],
	regions: [
		{
			id: regionId('main'),
			title: 'Main feed',
			type: 'hide',
			paths: 'inherit',
			selectors: ['#entries'],
			inject: {
				mode: 'before',
			}
		},
		{
			id: regionId('feed-chrome'),
			title: 'Filter bar and feed header',
			type: 'hide',
			paths: 'inherit',
			selectors: ['.menu.row', '.entries.io.row'],
		},
	]
}

export default site;
