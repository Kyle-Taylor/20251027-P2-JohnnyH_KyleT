package test.test;

import java.util.List;

import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/env")
public class EnvCheckController {

	private final Environment environment;

	private static final List<ConfigProbe> PROBES = List.of(
		new ConfigProbe("cloud.aws.credentials.access-key", true),
		new ConfigProbe("cloud.aws.credentials.secret-key", true),
		new ConfigProbe("cloud.aws.region.static", false),
		new ConfigProbe("cloud.aws.s3.bucket", false),
		new ConfigProbe("spring.mongodb.uri", true),
		new ConfigProbe("jwt.secret", true),
		new ConfigProbe("jwt.expirationMs", false),
		new ConfigProbe("spring.security.oauth2.client.registration.google.client-id", false),
		new ConfigProbe("spring.security.oauth2.client.registration.google.client-secret", true),
		new ConfigProbe("stripe.secret.key", true),
		new ConfigProbe("stripe.publishable.key", false),
		new ConfigProbe("stripe.webhook.secret", true)
	);

	public EnvCheckController(Environment environment) {
		this.environment = environment;
	}

	@GetMapping("/check")
	public List<ProbeResult> checkEnvironment() {
		return PROBES.stream()
			.map(this::probe)
			.toList();
	}

	private ProbeResult probe(ConfigProbe probe) {
		String value = environment.getProperty(probe.key());
		boolean present = value != null && !value.isBlank();
		String displayed = present ? (probe.secret() ? mask(value) : value) : "";
		int length = present ? value.length() : 0;
		return new ProbeResult(probe.key(), present, displayed, length);
	}

	private String mask(String value) {
		int len = value.length();
		int visible = Math.min(4, len);
		String prefix = value.substring(0, visible);
		return prefix + "*".repeat(Math.max(0, len - visible));
	}

	private record ConfigProbe(String key, boolean secret) {}

	private record ProbeResult(String key, boolean present, String value, int length) {}
}
