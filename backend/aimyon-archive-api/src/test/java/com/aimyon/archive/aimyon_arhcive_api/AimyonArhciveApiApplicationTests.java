package com.aimyon.archive.aimyon_arhcive_api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
class AimyonArhciveApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
