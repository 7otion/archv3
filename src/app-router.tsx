import { Route, Switch } from 'wouter';

import routes from '@/routes';

export function AppRouter() {
	return (
		<Switch>
			{routes.map(r => (
				<Route key={r.path} path={r.path} component={r.component} />
			))}
		</Switch>
	);
}
