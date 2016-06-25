@After=Index
Feature: Registration
  As a user
  I need to register an account
  so that I can log-in

  Background: Client defaults

    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Content-Type header

  Scenario: Create the accounts

    Given this is the request body
    --------------
    "email": "[email]",
    "firstname": "[firstname]",
    "lastname": "[lastname]",
    "password": "[password]"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201

  Where:
    email                          | firstname | lastname | password
    tanja-{time}@ausgaben.example  | Tanja     | Tacker   | suggest blue mood hill
    markus-{time}@ausgaben.example | Markus    | Tacker   | brush entire lucky recall

  Scenario: Activate the accounts

    Given I have the accountActivationToken for "[email]" in "activationToken"
    And "Bearer {activationToken}" is the Authorization header
    When I POST to {accountActivationEndpoint}
    Then the status code should be 204

  Where:
    email
    tanja-{time}@ausgaben.example
    markus-{time}@ausgaben.example

  Scenario: Login to the accounts

    Given this is the request body
    --------------
    "email": "[email]",
    "password": "[password]"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
    And the Content-Type header should equal "application/vnd.ausgaben.v1+json; charset=utf-8"
    And "$context" should equal "https://tools.ietf.org/html/rfc7519"
    And "token" should exist
    And I store "token" as "[storeName]Token"
    And I parse JWT token into "[storeName]TokenJwt"

  Where:
    email                          | password                  | storeName
    tanja-{time}@ausgaben.example  | suggest blue mood hill    | tanjas
    markus-{time}@ausgaben.example | brush entire lucky recall | markus
