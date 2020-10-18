import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { Portfolio } from '../entity/Portfolio';


export async function sendNewPortfolioEmail(portfolio: Portfolio) {
  const user = await getRepository(User).findOne(portfolio.userId);

  await sendEmail({
    to: user.email,
    template: 'createPortfolio',
    vars: {
      portfolioName: portfolio.name,
    },
    shouldBcc: true
  });
}
