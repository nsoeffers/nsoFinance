package be.nso.finance;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.persist.PersistService;

import javax.inject.Provider;
import javax.persistence.EntityManager;
import javax.servlet.*;
import java.io.IOException;

@Singleton
public class GAEPersistFilter implements Filter {

	private final PersistService persistService;

	@Inject
	private Provider<EntityManager> entityManagerProvider;

	@Inject
	public GAEPersistFilter(PersistService persistService) {
		this.persistService = persistService;
	}

	public void init(FilterConfig filterConfig) throws ServletException {
		persistService.start();
	}

	public void destroy() {
		persistService.stop();
	}

	public void doFilter(final ServletRequest servletRequest, final ServletResponse servletResponse,
						 final FilterChain filterChain) throws IOException, ServletException {
		entityManagerProvider.get().getTransaction().begin();
		filterChain.doFilter(servletRequest, servletResponse);
		entityManagerProvider.get().getTransaction().commit();
	}

}
