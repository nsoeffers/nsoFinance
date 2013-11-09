package be.nso.finance;

import be.nso.finance.handler.TransactionHandler;
import be.nso.finance.handler.security.Admin;
import be.nso.finance.handler.security.AuthorizationChecker;
import com.google.api.server.spi.guice.GuiceSystemServiceServletModule;
import com.google.inject.matcher.Matchers;
import com.google.inject.persist.jpa.JpaPersistModule;

import java.util.HashSet;

public class NsoFinanceServletModule extends GuiceSystemServiceServletModule {

	@Override
	protected void configureServlets() {
		super.configureServlets();
		HashSet<Class<?>> handlers = new HashSet<>();
		handlers.add(TransactionHandler.class);

		install(new JpaPersistModule("nsoFinancePU"));
		serveGuiceSystemServiceServlet("/_ah/spi/*", handlers);
		filter("/*").through(GAEPersistFilter.class);
		bindInterceptor(Matchers.any(), Matchers.annotatedWith(Admin.class), new AuthorizationChecker());
	}
}
