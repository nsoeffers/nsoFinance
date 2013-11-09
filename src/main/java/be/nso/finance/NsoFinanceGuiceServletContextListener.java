package be.nso.finance;

import be.nso.finance.repository.internal.RepositoryModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;

public class NsoFinanceGuiceServletContextListener extends GuiceServletContextListener {
	@Override
	protected Injector getInjector() {
		return Guice.createInjector(new RepositoryModule(), new NsoFinanceServletModule());
	}
}
