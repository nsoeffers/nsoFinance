package be.nso.finance.handler.security;

import com.google.api.server.spi.response.ForbiddenException;
import com.google.appengine.api.oauth.OAuthRequestException;
import com.google.appengine.api.users.User;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

import java.util.logging.Logger;

public class AuthorizationChecker implements MethodInterceptor {


	private static final Logger LOGGER = Logger.getLogger(AuthorizationChecker.class.getName());

	@Override
	public Object invoke(MethodInvocation invocation) throws Throwable {
		boolean verified = false;
		LOGGER.severe("Test: " + invocation.getMethod().toString());
		for (int i = 0; i < invocation.getMethod().getParameterTypes().length; i++) {
			LOGGER.severe("Parameter " + i + ": " + invocation.getArguments()[i]);
			if (User.class.equals(invocation.getMethod().getParameterTypes()[i])) {
				User user = (User) invocation.getArguments()[i];
				if (user == null) {
					throw new OAuthRequestException("This call requires authentication");
				}
				LOGGER.severe("EMAIL:" + user.getEmail());
				if ("nsoeffers@gmail.com".equals(user.getEmail())) {
					verified = true;
				}
			}
		}
		if (!verified) {
			throw new ForbiddenException("User is not an Admin");
		}
		return invocation.proceed();
	}
}
